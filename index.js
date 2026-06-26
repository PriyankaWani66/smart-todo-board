import { getTodos, addTodo, updateTodo, deleteTodo } from "./api.js";

//DOM elements
const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const pendingTodoList = document.getElementById("pending-todo-list");
const completedTodoList = document.getElementById("completed-todo-list");
const sortTasks = document.getElementById("sort-form");

let todos = [];
let editingTodoId = null;
const STORAGE_KEY = "smart-todo-board-todos";
let nextLocalId = Date.now();

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

function handleSort(event){
    event.preventDefault();

    todos.sort((a,b) => {
        return a.todo.localeCompare(b.todo);
    });

    saveTodos();
    renderTodos();
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
        const apiTodo = await addTodo(text);
        const newTodo = {
            ...apiTodo,
            id: Date.now(),
            isLocalTodo: true,
        };
        todos.push(newTodo);
        saveTodos();
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
    const currentTodo = todos.find((todo) => todo.id === id);

    try{
        if(action === "delete"){
            if (!currentTodo.isLocalTodo){
                await deleteTodo(id);
            }

            todos = todos.filter((todo) => todo.id !== id);
            saveTodos();
            renderTodos();
            return;
        }

        if(action === "toggle"){
            if (!currentTodo.isLocalTodo) {
                await updateTodo(id, {
                completed: !currentTodo.completed,
                });
            }

            todos = todos.map((todo) => {
                if (todo.id === id) {
                    return {
                        ...todo,
                        completed: !todo.completed,
                    };
                }

                return todo;
            });

            saveTodos();
            renderTodos();
            return;
        }

        if (action === "edit"){
            editingTodoId = id;
            renderTodos();
            return;
        }

        if (action === "cancel"){
            editingTodoId = null;
            renderTodos();
            return;
        }

        if (action === "save"){
            const todoItem = button.closest("li");
            const editInput = todoItem.querySelector(".edit-input");
            const updatedText = editInput.value.trim();

            if (updatedText === ""){
                return;
            }

            if (!currentTodo.isLocalTodo) {
                await updateTodo(id, {
                todo: updatedText,
                });
            }

            todos = todos.map((todo) => {
                if (todo.id === id) {
                    return {
                        ...todo,
                        todo: updatedText,
                    };
                }

                return todo;
            });

            saveTodos();
            editingTodoId = null;
            renderTodos();
        }
    } 
    catch(error){
        console.error(error.message);
    }
}

function saveTodos(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

//gets initial API data when the app begins
async function init(){
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    if (savedTodos){
        todos = JSON.parse(savedTodos);
        renderTodos();
        return;
    }

    try{
        const data = await getTodos();
        todos = data.todos;
        saveTodos();
        renderTodos();
    } 
    catch(error){
        console.error(error.message);
    }
}

//Event listeners
todoForm.addEventListener("submit", handleAddTodo);
sortTasks.addEventListener("submit", handleSort);
pendingTodoList.addEventListener("click", handleTodoAction);
completedTodoList.addEventListener("click", handleTodoAction);

init();





