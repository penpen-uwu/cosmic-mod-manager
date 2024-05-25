import { TrashIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { FormSuccessMessage } from "@/components/ui/form-message";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import useFetch from "@/src/hooks/fetch";
import type React from "react";
import { useState } from "react";
import SecurityLink from "./session-page-link";

const DeleteUserAccount = ({ code }: { code: string }) => {
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);
	const [actionResult, setActionResult] = useState<{
		success: boolean;
		message: string;
	} | null>(null);

	const dontDeleteAccount = async () => {
		if (loading) return;
		setLoading(true);

		const response = await useFetch("/api/user/discard-user-account-deletion", {
			method: "POST",
			body: JSON.stringify({ token: code }),
		});
		const result = await response.json();

		setLoading(false);
		if (result?.success === true) {
			setActionResult(result);
		}

		if (result?.success === true) {
			setActionResult(result);
		} else {
			toast({
				title: result?.message,
			});
		}
	};

	const deleteAccount = async () => {
		if (loading) return;
		setLoading(true);

		const response = await useFetch("/api/user/confirm-user-account-deletion", {
			method: "POST",
			body: JSON.stringify({ token: code }),
		});
		const result = await response.json();

		setLoading(false);
		if (result?.success === true) {
			setActionResult(result);
		}

		if (result?.success === true) {
			setActionResult(result);
		} else {
			toast({
				title: result?.message,
			});
		}

		setTimeout(() => {
			window.location.href = "/";
		}, 7_000);
	};

	if (actionResult?.success === true) {
		return (
			<div className="w-full max-w-md flex flex-col items-center justify-center gap-4">
				<FormSuccessMessage text={actionResult?.message} className="text-lg" />
			</div>
		);
	}

	return (
		<Card className="max-w-md gap-0 relative">
			<CardHeader className="text-xl ms:text-3xl text-left font-semibold text-foreground-muted">
				Delete your account
			</CardHeader>
			<CardContent>
				<p className="w-full text-left text-foreground-muted">
					Deleting your account will remove all of your data except your projects from our database. There is no going
					back after you delete your account.
				</p>
			</CardContent>
			<CardFooter className="w-full flex flex-col items-center justify-end gap-4">
				<div className="w-full flex items-center justify-end gap-4">
					<form
						name="Cancel"
						onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
							e.preventDefault();
							dontDeleteAccount();
						}}
					>
						<Button type="submit" variant="outline" aria-label="Cancel">
							Cancel
						</Button>
					</form>
					<form
						onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
							e.preventDefault();
							deleteAccount();
						}}
						name="Delete"
					>
						<Button
							type="submit"
							aria-label="Delete"
							className="flex items-center justify-center gap-2 bg-danger-bg hover:bg-danger-bg/85 text-[hsla(var(--foreground-dark))]"
						>
							<TrashIcon size="1rem" />
							Delete
						</Button>
					</form>
				</div>
				<div className="w-full flex items-center justify-start">
					<SecurityLink />
				</div>
			</CardFooter>
			{loading === true && (
				<div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full h-full rounded-xl flex items-center justify-center">
					<div className="w-full h-full flex items-center justify-center relative rounded-xl">
						<div className="w-full h-full absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-background opacity-60" />
						<Spinner size="1.5rem" />
					</div>
				</div>
			)}
		</Card>
	);
};

export default DeleteUserAccount;
