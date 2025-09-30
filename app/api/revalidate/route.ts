// app/api/revalidate/route.ts
import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { secret, slug } = body;

		if (secret !== process.env.REVALIDATE_SECRET) {
			return new Response("Unauthorized", { status: 401 });
		}

		if (!slug) {
			return new Response("Missing slug parameter", { status: 400 });
		}

		revalidatePath(`/${slug}`);
		return Response.json({ ok: true, revalidated: slug });
	} catch (error) {
		return Response.json({ ok: false, error: String(error) }, { status: 500 });
	}
}