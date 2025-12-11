const Layout = ({ children }: { children: React.ReactNode }) => {
    return( 
    <div className="flex flex-col h-screen min-w-screen items-center justify-center">
        {children}
    </div>
    )
};

export default Layout;