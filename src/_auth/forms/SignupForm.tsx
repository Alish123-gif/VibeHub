import { zodResolver } from "@hookform/resolvers/zod"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Link, useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { signupValidationSchema } from "@/lib/validation"
import Loader from "@/components/shared/Loader"
import { useCreateUserAccount, useSignInAccount } from "@/lib/react-query/queriesAndMutations"
import { useUserContext } from "@/context/AuthContext"

function SignupForm() {
    const { toast } = useToast()

    const { checkAuthUser, isLoading: isUserLoading } = useUserContext();
    const navigate = useNavigate();
    const { mutateAsync: createUserAccount, isPending: isCreatingUser } = useCreateUserAccount();
    const { mutateAsync: signInAccount, isPending: isSigningin } = useSignInAccount();
    // 1. Define your form.
    const form = useForm<z.infer<typeof signupValidationSchema>>({
        resolver: zodResolver(signupValidationSchema),
        defaultValues: {
            name: "",
            username: "",
            email: "",
            password: "",
        }
    })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof signupValidationSchema>) {
        const newUser = await createUserAccount(values);

        if (!newUser) return (toast({ title: "Sign up failed. Please try again.", variant: "destructive" }))
        const session = await signInAccount({ email: values.email, password: values.password })

        if (!session) return (toast({ title: "Sign in failed. Please try again.", variant: "destructive" }))
        const isLoggedIn = await checkAuthUser();

        if (isLoggedIn) {
            form.reset();
            navigate('/home')
        }else{
            return toast({ title: "Sign in failed. Please try again.", variant: "destructive" })
        }


    }
    return (
        <Form {...form}>
            <div className="sm:w-420 flex-center flex-col">
                <img src="/assets/images/logo.svg" alt="logo" />
                <h2 className="h3-bold md:h2-bold pt-2 sm:pt-5">
                    Create a new account
                </h2>
                <p className="text-light-3 small-medium md:base-regular mt-2">
                    To use VibeHub, Please enter your details
                </p>


                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-2 w-full mt-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input type="text" className="shad-input" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input type="text" className="shad-input" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" className="shad-input" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" className="shad-input" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="shad-button_primary hover:bg-gray-900">
                        {isCreatingUser ? (
                            <div className="flex-center gap-2">
                                <Loader />Loading...
                            </div>) : "Sign up"
                        }
                    </Button>
                    <p className="text-small-regular text-light-2 text-center mt-2">
                        Already have an account? <Link to='/sign-in' className="text-primary-500 text-small-semibold ml-1">Login</Link>
                    </p>
                </form>
            </div>
        </Form>
    )
}

export default SignupForm