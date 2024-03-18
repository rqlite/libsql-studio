import { NextRequest, NextResponse } from "next/server";
import { getSession, getSessionFromCookie } from "./auth";
import { Session, User } from "lucia";

type WithUserHandler<T = unknown> = (props: {
  req: NextRequest;
  user: User;
  session: Session;
  params: T;
}) => Promise<NextResponse>;

export default function withUser<ParamsType = unknown>(
  handler: WithUserHandler<ParamsType>
) {
  return async function (req: NextRequest, params: ParamsType) {
    let session = await getSession();
    console.log(session);

    if (!session) {
      session = await getSessionFromCookie();
      console.log(session);
    }

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user = session.user;
    const sess = session.session;

    if (!user || !sess) {
      return new Response("Unauthorized", { status: 401 });
    }

    return await handler({ req, user, session: sess, params });
  };
}
