interface Props{
    children: React.ReactNode;

}

const Layout = ({children}: Props) => {
    return(
        <div className="h-screen w-full min-w-0 overflow-x-hidden bg-black">
            {children}
        </div>
    )
}


export default Layout;