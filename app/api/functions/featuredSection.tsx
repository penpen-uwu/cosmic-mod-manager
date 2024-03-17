import { ContentCategories, FeaturedSectionContentData } from "@/types";

type Res = {
	featuredSectionContentData: FeaturedSectionContentData;
	message: string | null;
	success: boolean;
};

const getFeaturedSectionContent = async (): Promise<Res> => {
	const result: Res = {
		featuredSectionContentData: [],
		message: null,
		success: false,
	};

	// TODO: Write the logic to get featuredSectionData from database and
	//  cache it for some long period of time because this data is not going to change very often

	// Returning a mock response
	result.success = true;
	result.featuredSectionContentData = [
		{
			categoryName: ContentCategories.mod,
			title: "Popular mods",
			items: [
				{
					name: "Sodium",
					description: "A performace mod",
					logo: "NONE",
					url: "/mod/sodium",
				},
				{
					name: "Lithium",
					description: "A mod aimed to improve server performace",
					logo: "NONE",
					url: "/mod/lithium",
				},
				{
					name: "Furnicraft",
					description: "Add lots of amazing furnitures",
					logo: "NONE",
					url: "/mod/furnicraft",
				},
				{
					name: "Aether",
					description: "Adds a whole new Aether dimension to your game",
					logo: "NONE",
					url: "/mod/aether",
				},
			],
		},

		{
			categoryName: ContentCategories.resourcePack,
			title: "Popular resource packs",
			items: [
				{
					name: "Bare bones",
					description: "A bare bones texture pack",
					logo: "NONE",
					url: "/resourcepack/bare-bones",
				},
				{
					name: "Optifine grass texture",
					description: "Provides grass textures like optifine",
					logo: "NONE",
					url: "/resourcepack/optifine-grass-texture",
				},
				{
					name: "X-ray texture pack",
					description:
						"X-ray texture pack enables to see throught blocks and find ores",
					logo: "NONE",
					url: "/resourcepack/x-ray-texture-pack",
				},
				{
					name: "PVP God texture pack",
					description:
						"A resource pack that make you the god of PvP, even if your cps don't go above 5",
					logo: "NONE",
					url: "/resourcepack/pvp-god-texture-pack",
				},
			],
		},
	];

	return result;
};

export { getFeaturedSectionContent };
