import Link from 'next/link';

const Navbar = () => {
    return (
        <>
            <nav className="bg-sage-100 dark:bg-sage-dark-200 py-8 px-4 text-sage-800 dark:text-sage-800 relative">
                <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10">
                    <div>
                        <img src="/Footer-Logo-Saved-for-Web.gif" alt="Nursery Dashboard Logo" className="h-64" />
                    </div>
                    <div className="mt-4 flex space-x-4">
                        <Link href="/" className="hover:text-sage-300">Home</Link>
                        <Link href="/customers" className="hover:text-sage-300">Customers</Link>
                        <Link href="/wantlistdashboard" className="hover:text-sage-300">Want List</Link>
                        <Link href="/reports" className="hover:text-sage-300">Reports</Link>
                        <Link href="/plantknowledgebase" className="hover:text-sage-300">Plant Knowledge Base</Link>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-sage-100 to-sage-280 blur-sm"></div>
            </nav>
            <div className="h-8 bg-gradient-to-b from-sage-600 to-sage-390"></div>
        </>
    );
};

export default Navbar;