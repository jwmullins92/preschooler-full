import {useEffect, useState} from 'react';
import {Student} from "../../../lib/types/types.ts";
import {apiGet} from "../utils/functions.ts";

const MyStudents = () => {

    const [students, setStudents] = useState<Student[]>()

    useEffect(() => {
        apiGet('/students').then(setStudents)
    }, [])

    return (
        <div>
            <h2>
                My Students
            </h2>
            {
                students && students.map(student => {
                    return (
                        <div>
                            <p>{student.last_name} {student.last_name}</p>
                        </div>
                    )
                })
            }
        </div>
    );
};

export default MyStudents;
