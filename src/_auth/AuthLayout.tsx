import { useUserContext } from "@/context/AuthContext";
import { Outlet, Navigate } from "react-router-dom"

function AuthLayout() {
    const { isAuthenticated, isLoading } = useUserContext()

    return (
        <>
            {isLoading ? <></>
                :
                isAuthenticated ? (
                    <Navigate to='/' />
                ) : (
                    <>
                        <section className="flex flex-1 justify-center items-center flex-col py-10 w-full h-screen">
                            <Outlet />
                        </section>
                        <div className="hidden xl:block w-1/2 h-screen relative">
                            <div className="h-full w-full absolute inset-0 bg-black opacity-60"></div>
                            <img
                                src="/assets/images/side-img.jpg"
                                alt="logo"
                                className="h-full w-full object-cover bg-no-repeat"
                            />
                        </div>
                    </>
                )}
        </>
    )
}

export default AuthLayout
