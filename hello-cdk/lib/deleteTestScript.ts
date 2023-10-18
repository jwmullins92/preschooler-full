const execute = async () => {
    const parent = await (await fetch(`http://localhost:3000/parent`, {
        method: "POST",
        headers: {
            "Content-Type": `application/json`
        },
        body: JSON.stringify({
            "firstName": "Jared",
            "lastName": "Mullins",
            "phoneNumber": "12345",
            "address": "123 My house",
            "email": "jared1@gmail.com"
        })
    })).json()

    console.log(parent)

    const student = await fetch(`http://localhost:3000/student`, {
        method: "POST",
        headers: {
            "Content-Type": `application/json`
        },
        body: JSON.stringify({
            "student": {
                "firstName": "Test",
                "lastName": "TEST",
                "birthDate": "2019-09-05"
            },
            "parentId": parent._id
        })
    })
}

execute()