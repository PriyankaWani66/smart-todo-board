const BASE_URL = "https://dummyjson.com/todos";

//READ - get the initial list of todo's
export async function getTodos(){
    const response = await fetch(BASE_URL);

    if(!response.ok){
        throw new Error("Could not fetch to-do's");
    }

    return response.json();
}

//ADD - add a new todo
export async function addTodo(text){
    const response = await fetch(BASE_URL + "/add",{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            todo: text,
            completed: false,
            userId: 1,
        }),
    });

    if(!response.ok){
        throw new Error("Could not add todo");
    }

    return response.json();
}

//DELETE - remove a todo
export async function deleteTodo(id){
    const response = await fetch(BASE_URL + "/" + id,{
        method: "DELETE",
    });

    if(!response.ok){
        throw new Error("Could not delete todo");
    }

    return response.json();
}

//UPDATE - edit a todo or change completed status
export async function updateTodo(id, update){
    const response = await fetch(BASE_URL + "/" + id,{
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(update),
    });

    if(!response.ok){
        throw new Error("Could not update todo");
    }

    return response.json();
}