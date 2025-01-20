import Link from 'next/link';

const Navbar = () => {
    return (
        <nav className="bg-sage-700 p-4 text-white">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="text-2xl font-bold">Nursery Dashboard</div>
                <div className="space-x-4">
                    <Link href="/" className="hover:text-sage-300">Home</Link>
                    <Link href="/customers" className="hover:text-sage-300">Customers</Link>
                    <Link href="/wantlistdashboard" className="hover:text-sage-300">Want List</Link>
                    <Link href="/reports" className="hover:text-sage-300">Reports</Link>
                    <Link href="/plantknowledgebase" className="hover:text-sage-300">Plant Knowledge Base</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;