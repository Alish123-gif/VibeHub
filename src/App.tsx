
import './globals.css'
import { Routes, Route } from 'react-router-dom'
import { AllUsers, Chat, CreatePost, EditPost, Explore, Home, PostDetails, Profile, Saved, Settings, UpdateProfile } from './_root/pages/index'
import { SigninForm, SignupForm } from './_auth/forms'
import AuthLayout from './_auth/AuthLayout'
import RootLayout from './_root/RootLayout'
import { Toaster } from "@/components/ui/toaster"
import ChatRoom from './components/shared/ChatRoom'

function App() {
    return (
        <main className='flex h-screen'>
            <Routes>
                {/* public routes */}
                <Route element={<AuthLayout />}>
                    <Route path="/sign-in" element={<SigninForm />} />
                    <Route path="/sign-up" element={<SignupForm />} />
                </Route>


                {/* private routes */}
                <Route element={<RootLayout />}>
                    <Route index element={<Home />} />
                    <Route path="/explore" element={<Explore />} />
                    {/* <Route path="/saved" element={<Saved />} /> */}
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/all-users" element={<AllUsers />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/chat/:id" element={<ChatRoom />} />
                    <Route path="/all-users/:id" element={<AllUsers />} />
                    <Route path="/create-post" element={<CreatePost />} />
                    <Route path="/update-post/:id" element={<EditPost />} />
                    <Route path="/posts/:id" element={<PostDetails />} />
                    <Route path="/profile/:id/*" element={<Profile />} />
                    <Route path="/update-profile/:id" element={<UpdateProfile />} />
                </Route>

            </Routes>

            <Toaster />
        </main>

    )
}

export default App