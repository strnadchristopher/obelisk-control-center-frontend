import { useEffect, useState } from "react";

function TaskListModal() {
    const [taskList, setTaskList] = useState([]);

    // Load the task list from local storage, if it exists
    useEffect(() => {
        const taskList = localStorage.getItem("taskList");
        if (taskList) {
            setTaskList(JSON.parse(taskList));
        }
    }, []);

    const updateTaskList = (taskList) => {
        setTaskList(taskList);
        localStorage.setItem("taskList", JSON.stringify(taskList));
    };
    return (
        <>
            {/* Input to add a task */}
            <input
                className="modal InputModal"
                type="text"
                placeholder="Add a task"
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        const newTask = {
                            title: event.target.value,
                            description: "",
                            dueDate: "",
                        };
                        updateTaskList([...taskList, newTask]);
                        event.target.value = "";
                    }
                }}
            />
            {taskList.map((task) => (
                <TaskItem task={task} updateTaskList={updateTaskList} />
            ))}
        </>
    );
}

function TaskItem({ task, updateTaskList }) {
    // So this will have a button to complete the task, and display it's title and have a expandable drop down if the task has more details
    const [expanded, setExpanded] = useState(false);
    const toggleExpanded = () => {
        setExpanded(!expanded);
    };
    return (
        <div
        // Ensure the onclick event fires on the parent, but not on any children
        onClick={(event) => {
            if (event.target === event.currentTarget) {
                toggleExpanded();
            }
        }}
        className="modal TaskModal">
            <div className="modal-content">
                <h3
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        toggleExpanded();
                    }
                }}
                >{task.title}</h3>
                {/* If Expanded show a textbox, filled with the description text, or empty if there is no description set, and when the description changes, update the task list */}
                {expanded && (
                    <textarea
                        className="TaskDescription"
                        value={task.description}
                        onChange={(event) => {
                            task.description = event.target.value;
                            updateTaskList([...taskList]);
                        }}
                    />
                )}
            </div>
        </div>
    );
}


export default TaskListModal;