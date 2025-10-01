import express, { Request, Response } from 'express'
import { z, ZodError } from 'zod'
import { requireAuth } from '../middlewares/auth'
import { csrfSynchronisedProtection } from '../config/session'
import { User } from '../models/User'
import {
  TAB_CHARACTER_LIMIT,
  TAB_LIMIT,
  TAB_TITLE_CHARACTER_LIMIT,
} from '../config/const.ts'

const tabRoutes = express.Router()

const TabInputSchema = z.object({
  title: z.string().max(TAB_TITLE_CHARACTER_LIMIT).optional().default(''),
  content: z.string().max(TAB_CHARACTER_LIMIT).optional().default(''),
})

const getTabs = async (req: Request, res: Response) => {
  // requireAuth ensures req.user
  const user = await User.findById(req.user!.id)
  const tabs = (user?.tabs || []).map((tab) => ({
    id: tab._id.toString(),
    title: tab.title,
    content: tab.content,
    updated: tab.updated,
  }))
  res.json(tabs)
}

const getTab = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const user = await User.findOne(
      // requireAuth ensures req.user
      { _id: req.user!.id, 'tabs._id': id },
      { 'tabs.$': 1 },
    )

    if (!user || !user.tabs || user.tabs.length === 0) {
      return res.status(404).json({ error: 'Tab not found' })
    }

    const tab = user.tabs[0]
    res.json({
      id: tab._id.toString(),
      title: tab.title,
      content: tab.content,
      updated: tab.updated,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching tab:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const createTab = async (req: Request, res: Response) => {
  try {
    const validatedData = TabInputSchema.parse(req.body)
    const { title, content } = validatedData

    const user = await User.findById(req.user!.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.tabs.length >= TAB_LIMIT) {
      return res
        .status(400)
        .json({ error: `Maximum tabs limit reached (${TAB_LIMIT} tabs)` })
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user!.id,
      { $push: { tabs: { title, content } } },
      { new: true },
    )

    const newTab = updatedUser!.tabs[updatedUser!.tabs.length - 1]
    res.json({
      id: newTab._id.toString(),
      title: newTab.title,
      content: newTab.content,
      updated: newTab.updated,
    })
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ error: 'Invalid input', details: error.issues })
    }

    throw error
  }
}

const updateTab = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const validatedData = TabInputSchema.parse(req.body)
    const { title, content } = validatedData
    const user = await User.findOneAndUpdate(
      // requireAuth ensures req.user
      { _id: req.user!.id, 'tabs._id': id },
      {
        $set: {
          'tabs.$.title': title,
          'tabs.$.content': content,
          'tabs.$.updated': Date.now(),
        },
      },
      { new: true },
    )
    const updatedTab = user?.tabs.find((d) => d._id.toString() === id)

    if (updatedTab) {
      res.json({
        id: updatedTab._id.toString(),
        title: updatedTab.title,
        content: updatedTab.content,
        updated: updatedTab.updated,
      })
    } else {
      res.status(404).json({ error: 'Tab not found' })
    }
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ error: 'Invalid input', details: error.issues })
    }

    throw error
  }
}

const deleteTab = async (req: Request, res: Response) => {
  const { id } = req.params

  // requireAuth ensures req.user
  await User.findByIdAndUpdate(req.user!.id, { $pull: { tabs: { _id: id } } })
  res.json({ success: true })
}

tabRoutes.get('/api/tabs', requireAuth, getTabs)
tabRoutes.get('/api/tabs/:id', requireAuth, getTab)
tabRoutes.post('/api/tabs', requireAuth, csrfSynchronisedProtection, createTab)
tabRoutes.put(
  '/api/tabs/:id',
  requireAuth,
  csrfSynchronisedProtection,
  updateTab,
)
tabRoutes.delete(
  '/api/tabs/:id',
  requireAuth,
  csrfSynchronisedProtection,
  deleteTab,
)

export { tabRoutes }
