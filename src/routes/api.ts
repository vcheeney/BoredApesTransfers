import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async (request) => {
	const ipfsUrl = request.url.searchParams.get('url').toString();

	const ipfsUrlParts = ipfsUrl.split('/');

	const dataGatewayUrl = `https://ipfs.io/ipfs/${ipfsUrlParts[2]}/${ipfsUrlParts[3]}`;
	const data = await (await fetch(dataGatewayUrl)).json();

	const imgUrlParts = data.image.split('/');
	const imgGatewayUrl = `https://ipfs.io/ipfs/${imgUrlParts[2]}`;

	return {
		body: {
			imageUrl: imgGatewayUrl
		}
	};
};
