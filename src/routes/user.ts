import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
import { signupInput, signinInput } from "@kris08/medium-common"

export const userrouter = new Hono<{
  Bindings: {
    DATABASE_URL: string
  }
}>();


userrouter.post('/signup', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const body = await c.req.json();
  const { success } = signupInput.safeParse(body)
  if (!success) {
    c.status(411);
    return c.json({
      message: "Input not correct"
    })
  }
  try {
    const user = await prisma.user.create({
      data: {
        name:body.name,
        email: body.email,
        password: body.password
      }
    })

    const secret = 'mySecretKey'
    const token = await sign({ id: user.id }, secret)
    return c.json(token)

  }
  catch (e) {
    c.status(403);
    return c.json({ error: "error while signing up" });
  }
})


////////////////////////////////////////////////////



userrouter.post('/signin', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const body = await c.req.json();
  const { success } = signinInput.safeParse(body)
  if (!success) {
    c.status(411);
    return c.json({
      message: "Input not correct"
    })
  }

  const user = await prisma.user.findUnique({
    where: {
      email: body.email
    }
  })


  if (!user) {
    c.status(403);
    return c.json({ error: "user not found" });
  }
  const secret = 'mySecretKey';

  const token = await sign({ id: user.id }, secret)

  return c.json(token)
})
