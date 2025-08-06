import { type NextApiRequest, type NextApiResponse } from "next";
import { getServerAuthSession } from "~/server/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerAuthSession({ req, res });
  
  res.status(200).json({ 
    hasSession: !!session,
    user: session?.user ? {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    } : null,
    sessionExpires: session?.expires,
  });
}