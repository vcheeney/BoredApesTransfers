export type NftTransfer = {
	id: string;
	from: string;
	to: string;
	tokenId: string;
	image: string;
};

export const createTransferObject = async (event: any, dataUri: string): Promise<NftTransfer> => {
	const url = `/api?url=${encodeURIComponent(dataUri)}`;
	const data = await fetch(url);
	const json = await data.json();

	return {
		id: event.id,
		from: event.returnValues.from,
		to: event.returnValues.to,
		tokenId: event.returnValues.tokenId,
		image: json.imageUrl
	};
};
