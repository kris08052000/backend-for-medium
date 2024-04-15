import {Hono} from "hono"
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt';
import {createPost,updatePost} from "@kris08/medium-common"

export const blogrouter = new Hono<{
    Bindings:{
      DATABASE_URL:string
    },
    Variables:{
        userId: string
    }
  }>();


/////////////////////////////////


  blogrouter.use('/*', async (c, next) => {
    const secret = 'mySecretKey'
    const jwt = await c.req.header("authorization");
    if (!jwt) {
          c.status(401);
          return c.json({ error: "unauthorized" });
      }
     //const token = jwt.split(' ')[1];    (Since we are not using bearer so i am commenting this line)
    const user  = await verify(jwt,secret)
    if(!user){
      c.status(401);
          return c.json({ error: "unauthorized" });
    }
    c.set('userId', user.id);
      await next()
  })


//////////////////////////////


  blogrouter.post('/', async (c) => {
    const body = await c.req.json();
    const {success} = createPost.safeParse(body)
    if(!success){
      c.status(411);
      return c.json({
        message:"Input not correct"
      })
    }
    const authorId = c.get("userId")
    const prisma = new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const post =  await prisma.post.create({
        data:{
            title: body.title,
            content: body.content,
            authorId: authorId
        }
    })
    return c.json({id:post.id})
  })


/////////////////////////////

  
  blogrouter.put('/', async (c)=>{
    const body = await c.req.json();
    const {success} = updatePost.safeParse(body)
    if(!success){
      c.status(411);
      return c.json({
        message:"Input not correct"
      })
    }
    const prisma = new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const post =  await prisma.post.update({
        where:{
            id:body.id
        },
        data:{
            title: body.title,
            content: body.content,
        }
    })
    return c.json({id:post.id})
  })


   /////////////////////////////


   blogrouter.get('/bulk', async (c)=>{
    const prisma = new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const blogPost = await prisma.post.findMany({
      select:{
        content:true,
        title:true,
        id:true,
        author:{
          select:{
            name:true
          }
        }
      }
    });
    return c.json({blogPost})
  })


/////////////////////////////

  
  blogrouter.get('/:id',async (c)=>{
    const id =  c.req.param("id");
    const prisma = new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try{
        const blog =  await prisma.post.findFirst({
            where:{
                id:id
            },
            select:{
              id:true,
              title: true,
              content:true,
              author:{
                select:{
                  name:true
                }
              }
            }
        })
        return c.json({blog})
    }
    catch(e){
        c.status(411);
        return c.json({
            message: "Error while fetching the blog post"
        })
    }
  })  
  


 

