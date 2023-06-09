import { PgQueryResponse, PgQueryError } from "@/types";
import { pool } from "@/utils/postgres";
import argon2 from "argon2";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // This function runs when users signin through next-auth. check it out at localhost:3000/api/auth/signin
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)
        const user = await pool
          .query(`SELECT * FROM "user" WHERE username = $1;`, [
            credentials?.username,
          ])
          // ^find the user whose trying to signin to the db
          .then(async (res: PgQueryResponse) => {
            if (res.rows.length === 0) return null;
            // ^only have to return null if we don't find a match. next-auth handles the error message for us on the frontend
            const { id, password } = res.rows[0];

            const correctPassword = await argon2.verify(
              password!,
              credentials!.password
            );
            // ^ verify returns a Promise<boolean> after comparing the plain text the user entered with the hashed password we found in the database
            if (!correctPassword) return null;

            return {
              id,
            };
          })
          .catch((e: PgQueryError) => {
            console.log(e);
            return null;
          });
        // Return null if user data could not be retrieved
        return user;
      },
    }),
    // ...add more providers here
  ],
  callbacks: {
    async redirect({ baseUrl }: any) {
      // Allows relative callback URLs
      // Allows callback URLs on the same origin
      return baseUrl;
    },
    // I used these two callbacks to move some values around so that user.id is available in both the token and the session objects. might come in handy. this data is accessible in the client via getToken and getSession/useSession. since a token (token.jti) and the user id are both available in the token object, we'll call getToken to get those two values and use them as arguments for the me query
    async jwt({ token, user }: any) {
      // user is the value returned from the authorize function above
      user && (token.user = user);
      // console.log("token", token)
      // token {
      //   sub: '6',
      //   user: { id: 6 },
      //   iat: 1676950152,
      //   exp: 1679542152,
      //   jti: 'cdce51a6-7d61-4e2d-9bbc-6ed288bf91a2'
      // }
      return token;
    },
    async session({ session, token }: any) {
      session.user = {
        id: String(token.user.id),
        token: token.jti,
      };
      // console.log("session", session)
      // session {
      //   user: {
      //     id: 6
      //     token: 'cdce51a6-7d61-4e2d-9bbc-6ed288bf91a2'
      //   }
      // }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
export default NextAuth(authOptions);
