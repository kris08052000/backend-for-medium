import { Hono } from 'hono'
import {userrouter} from "./routes/user"
import {blogrouter} from "./routes/blog"
import { cors } from 'hono/cors'

const app = new Hono<{
  Bindings:{
    DATABASE_URL :string
  },
  Variables : {
    userId: string
  }
}>();


app.use('/*', cors())
/////////////////////////////////////////////////////////
app.route('/api/v1/user', userrouter);
app.route('/api/v1/blog', blogrouter);


export default app


////////////////////////////////////////////////////////////////////