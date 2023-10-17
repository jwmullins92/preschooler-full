import {Link} from "react-router-dom";

const Navbar = () => {
    return (
        <nav className='w-full flex items-center px-6 h-header bg-headerPurple fixed'>
            <Link to={'/'} className='text-white' >Home</Link>
        </nav>
    );
};

export default Navbar;
