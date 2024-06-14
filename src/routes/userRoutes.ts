import { Request, Response, Router } from "express";
import User, { IUser } from "../model/user";
import { hashPassword } from "../utils/hashPassword";
import bcrypt from 'bcrypt'
import { generateToken } from "../utils/jwt";

const router = Router()

router.post('/register', async (req: Request, res: Response) => {
    const { email, password }: IUser = req.body

    try {
        const hashedPassword = await hashPassword(password)
        const newUser = new User({ email, password: hashedPassword})
        await newUser.save()

        try {
            const token = generateToken(newUser.id.toString())
            return res.status(200).json({ token })
        } catch (e) {
            return res.status(500).json({ message: 'Internal server error'})
        }

    } catch (error) {
        res.status(500).json({ message: `Error creating user: ${error}` })
    }
})

router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const user = await User.findById(id)
        if (!user) {
            return res.status(400).send('User not found')
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: `Error finding user: ${error}` })
    }
})

router.get('/email/:email', async (req: Request, res: Response) => {
    const { email } = req.params
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: 'User not found' })
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: `Error finding user: ${error}` })
    }
})

router.post('/login', async (req: Request, res: Response) => {
    const { email, password }: IUser = req.body

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }        

        const token = generateToken(user.id.toString())
        return res.status(200).json({ token })
    } catch (error) {
        return res.status(500).json({ message: `Error login: ${error}` })
    }
})

export default router