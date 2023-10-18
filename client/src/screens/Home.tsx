import MyStudents from "../components/MyStudents";
import {useContext} from "react";
import {UserContext} from "../context/UserContext";

const Home = () => {
    const user = useContext(UserContext);
    return (
        <div className='min-h-full'>
            <h1 className='text-3xl font-lato font-bold'>Hello, {user?.firstName}</h1>
                <MyStudents />
        </div>
    );
};

export default Home;
