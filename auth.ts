//     This file is part of Cosmic Reach Mod Manager.
//
//    Cosmic Reach Mod Manager is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
//
//    Cosmic Reach Mod Manager is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
//   You should have received a copy of the GNU General Public License along with Cosmic Reach Mod Manager. If not, see <https://www.gnu.org/licenses/>.

import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Providers, UserRoles } from "@prisma/client";
import {
	findUserByEmail,
	findUserById,
	getCurrentAuthUser,
	matchPassword,
} from "@/app/api/actions/user";
import db from "@/lib/db";
import { parseProfileProvider, parseUsername } from "@/lib/user";

declare module "next-auth" {
	interface User {
		role?: UserRoles;
		userName?: string;
		profileImageProvider?: string;
		emailVerified: Date;
	}
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	callbacks: {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		async signIn({ user, account }): Promise<any> {
			user.userName = parseUsername(user.id);
			user.profileImageProvider = account.provider;

			// Delete the previous auth provider if the same provider is registered with different email to the same account
			try {
				await db.account.deleteMany({
					where: {
						userId: user?.id,
						provider: account?.provider,
					},
				});
			} catch (error) {}

			// To prevent the user from being logged into other account when linking a provider account with different email
			const alreadyLoggedInUser = await getCurrentAuthUser();

			if (alreadyLoggedInUser?.id) {
				// Check if there is already the same provider linked to this account with different email
				const linkedProviders = await db.account.findMany({
					where: {
						userId: alreadyLoggedInUser?.id,
						provider: account.provider,
					},
					select: {
						userId: true,
					},
				});

				if (linkedProviders?.length > 0) {
					try {
						await db.account.deleteMany({
							where: {
								userId: alreadyLoggedInUser?.id,
								provider: account.provider,
							},
						});
					} catch (error) {}
				}

				return alreadyLoggedInUser;
			}

			const existingAccount = await db.account.findFirst({
				where: { providerAccountId: account?.providerAccountId },
			});

			if (existingAccount?.userId) {
				const userData = await findUserById(existingAccount?.userId);

				if (userData?.id) return userData;
			}

			return user;
		},

		async session({ session, token }) {
			if (token?.sub) {
				session.user.id = token.sub;
			}

			return session;
		},

		async jwt({ token }) {
			return token;
		},
	},

	events: {
		...authConfig,
		async linkAccount({ user, account }) {
			// Set the email verified for oauth users
			const userData = await findUserById(user.id);

			const data: {
				emailVerified?: Date;
				profileImageProvider?: Providers;
			} = {};

			if (!userData?.emailVerified || !userData?.profileImageProvider) {
				if (!userData?.emailVerified) {
					data.emailVerified = new Date();
				}

				if (!userData?.profileImageProvider) {
					data.profileImageProvider = parseProfileProvider(account.provider);
				}

				await db.user.update({
					where: {
						id: user?.id,
					},
					data,
				});
			}
		},
		async signIn({ user, account, profile }) {
			// profile?.image_url   ==>   Discord
			// profile?.picture     ==>   Google
			// profile?.avatar_url  ==>   Github and Gitlab
			const profileImageLink =
				profile?.image_url || profile?.picture || profile?.avatar_url;

			await db.account.updateMany({
				where: { userId: user?.id, provider: account?.provider },
				data: {
					profileImage: profileImageLink,
					providerAccountEmail: profile?.email,
				},
			});
		},
	},
	adapter: PrismaAdapter(db),
	session: { strategy: "jwt" },
	secret: process.env.AUTH_SECRET,
	providers: [
		...authConfig.providers,
		CredentialsProvider({
			id: "credentials",
			name: "Credentials",
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				const userData = await db.user.findUnique({
					where: { email: credentials.email as string },
				});

				const isCorrectPassword = await matchPassword(
					credentials?.password as string,
					userData.password,
				);

				if (isCorrectPassword) {
					const user = await findUserByEmail(credentials?.email as string);
					return user;
				}

				return null;
			},
		}),
	],
});
