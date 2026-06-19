import { getTodos, addTodo, updateTodo, deleteTodo } from "./api.js";

//DOM elements
const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const pendingTodoList = document.getElementById("pending-todo-list");
const completedTodoList = document.getElementById("completed-todo-list");

let todos = [];
let editingTodoId = null;

//creates one <li> for one todo
function createTodoElement(todo){
    const todoItem = document.createElement("li");
    todoItem.classList.add("todo-item");
    
    //When this todo is being edited, show an input and Save button
    if (editingTodoId === todo.id){
        const editInput = document.createElement("input");
        editInput.classList.add("edit-input");
        editInput.value = todo.todo;

        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.dataset.action = "save";
        saveButton.dataset.id = todo.id;

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.dataset.action = "cancel";
        cancelButton.dataset.id = todo.id;

        todoItem.append(editInput, saveButton, cancelButton);

        return todoItem;
    }
    const todoText = document.createElement("span");
    todoText.classList.add("todo-text");
    todoText.textContent = todo.todo;

    const actionButtons = document.createElement("div");
    actionButtons.classList.add("todo-actions");

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.dataset.action = "edit";
    editButton.dataset.id = todo.id;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.id = todo.id;

    const toggleButton = document.createElement("button");
    if(todo.completed){
        toggleButton.textContent = "<-";
    }else{
        toggleButton.textContent = "->";
    }
    toggleButton.dataset.action = "toggle";
    toggleButton.dataset.id = todo.id;

    actionButtons.append(editButton, deleteButton, toggleButton);
    todoItem.append(todoText, actionButtons);
    return todoItem;
}

//Clears both lists and adds every todo to the correct list
function renderTodos() {
    pendingTodoList.replaceChildren();
    completedTodoList.replaceChildren();
    
    for(const todo of todos){
        const todoItem = createTodoElement(todo);
        
        if (todo.completed){
            completedTodoList.append(todoItem);
        } else{
            pendingTodoList.append(todoItem);
        }
    }
}

//Adds a new todo
async function handleAddTodo(event){
    event.preventDefault();
    const text = todoInput.value.trim();
    if (text === ""){
        return;
    }

    try{
        const newTodo = await addTodo(text);

        todos.push(newTodo);

        todoInput.value = "";
        renderTodos();
    } 
    catch(error){
        console.error(error.message);
    }
}

//Handles Edit, Save, Delete, Cancel, and Toggle clicks
async function handleTodoAction(event){
    const button = event.target.closest("button[data-action]");
    
    if(!button){
        return;
    }

    const action = button.dataset.action;
    const id = Number(button.dataset.id);

    try{
        if(action === "delete"){
            await deleteTodo(id);

            todos = todos.filter((todo) => todo.id !== id);

            renderTodos();
        }

        if(action === "toggle"){
            const currentTodo = todos.find((todo) => todo.id === id);

            const updatedTodo = await updateTodo(id,{
                completed: !currentTodo.completed,
            });

            todos = todos.map((todo) => {
                if (todo.id === id){
                    return { ...todo, ...updatedTodo };
                }
                return todo;
            });

            renderTodos();
        }

        if (action === "edit"){
            editingTodoId = id;
            renderTodos();
        }

        if (action === "cancel"){
            editingTodoId = null;
            renderTodos();
        }

        if (action === "save"){
            const todoItem = button.closest("li");
            const editInput = todoItem.querySelector(".edit-input");
            const updatedText = editInput.value.trim();

            if (updatedText === ""){
                return;
            }

            const updatedTodo = await updateTodo(id,{
                todo: updatedText,
            });

            todos = todos.map((todo) => {
                if (todo.id === id){
                    return { ...todo, ...updatedTodo };
                }
                return todo;
            });

            editingTodoId = null;
            renderTodos();
        }
    } 
    catch(error){
        console.error(error.message);
    }
}

//gets initial API data when the app begins
async function init(){
    try{
        const data = await getTodos();
        todos = data.todos;
        renderTodos();
    } 
    catch(error){
        console.error(error.message);
    }
}

//Event listeners
todoForm.addEventListener("submit", handleAddTodo);
pendingTodoList.addEventListener("click", handleTodoAction);
completedTodoList.addEventListener("click", handleTodoAction);

init();