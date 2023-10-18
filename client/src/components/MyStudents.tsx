import {UserContext} from "../context/UserContext";
import {useContext} from "react";
import {ParentWithId} from "../../../hello-cdk/lib/types/types";

const MyStudents = () => {

    const user = useContext(UserContext) as ParentWithId
    return (
        <div className='border w-1/3 bg-white p-4 drop-shadow-lg'>
            <h2 className='font-lato'>
                My Students
            </h2>
            {
                user?.students && user.students.map(student => {
                    return (
                            <p className='font-lato' key={student._id}>{student.firstName} {student.lastName}</p>
                    )
                })
            }
        </div>
    );
};

export default MyStudents;
