import { type Context, Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'

const defaultHeaders = {
  headers: {
    'Cache-Control': 'max-age=3600',
  },
}

const app = new Hono()

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET'],
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
)

if (process.env.NODE_ENV !== 'production') {
  app.use('*', (c, next) => {
    console.log('[req]', c.req.url)
    return next()
  })
}

function authorize(c: Context) {
  const authorization = c.req.header('Authorization')

  const token = authorization?.split(' ')[1]

  if (!token) {
    throw new HTTPException(401, {
      message: 'Unauthorized',
    })
  }
}

app.get('/r/schema.json', async (c) => {
  const file = await import('../public/r/schema.json')
  return c.json(file.default, defaultHeaders)
})

app.get('/r/index.json', async (c) => {
  const file = await import('../public/r/index.json')
  return c.json(file.default, defaultHeaders)
})

app.get('/r/styles/:style/:component{.+\\.json$}', async (c) => {
  const { style, component } = c.req.param()

  const file = await import(`../public/r/styles/${style}/${component}`)

  const content = file.default

  if (file.private) {
    authorize(c)
  }

  return c.json(content, defaultHeaders)
})

export { app }
