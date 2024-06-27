import { z } from "zod"


export const signupValidationSchema = z.object({
    name: z.string().min(3, { message: 'Too short' }).max(20),
    username: z.string().min(2, { message: 'Too short' }).max(50),
    email: z.string().email(),
    password: z.string().min(8, { message: 'Weak password' }),
})
export const signinValidationSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, { message: 'Weak password' }),
})
export const postValidationSchema = z.object({
    caption: z.string().min(2).max(200),
    file: z.custom<File[]>(),
    location: z.string().min(2).max(200),
    tags: z.string().max(200)
})