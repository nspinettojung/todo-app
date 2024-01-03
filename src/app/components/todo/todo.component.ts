import { Component, computed, effect, signal } from '@angular/core';
import { FilterType, TodoModels } from '../../models/todo-models';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent {
  todolist = signal<TodoModels[]>([]);

  //Filtro

  filter = signal<FilterType>('all');

  todoListFiltered = computed(() => {
    const filter = this.filter();
    const todos = this.todolist();

    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  })

  changeFilter(filterString: FilterType) {
    this.filter.set(filterString);
  }


  newTodo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)]
  })

  constructor() {
    effect(() => {
      localStorage.setItem('todos', JSON.stringify(this.todolist()));
    })
  }

  ngOnInit() {
    const storage = localStorage.getItem('todos');
    if (storage) {
      this.todolist.set(JSON.parse(storage));
    }
  }

  //Crud

  addTodo() {
    const newTodoTitle = this.newTodo.value.trim();
    if (this.newTodo.valid && newTodoTitle !== '') {
      this.todolist.update((prev_todos) => {
        return [
          ...prev_todos,
          { id: Date.now(), title: newTodoTitle, completed: false, editing: false }
        ]
      })
      this.newTodo.reset();
    } else {
      this.newTodo.reset();
    }
  }

  toggleTodo(todoId: number) {
    this.todolist.update((prev_todos) => prev_todos.map((todo) => {

      return todo.id === todoId ?
        { ...todo, completed: !todo.completed }
        : todo;

    }));
  }

  removeTodo(todoId: number) {
    this.todolist.update((prev_todos) => prev_todos.filter((todo) => todo.id !== todoId))
  }

  editTodo(todoId: number) {
    return this.todolist.update((prev_todos) =>
      prev_todos.map((todo) => {
        return todo.id === todoId ?
          { ...todo, editing: true } : { ...todo, editing: false }
      })
    )
  }

  saveTodo(todoId: number, event: Event) {
    const title = (event.target as HTMLInputElement).value;
    this.todolist.update((prev_todos) => prev_todos.map((todo) => {
      return todo.id === todoId ? { ...todo, title: title, editing: false } : todo;
    }))
  }

}
