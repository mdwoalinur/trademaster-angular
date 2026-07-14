
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ExpenseCategory } from '../models/expense-category.model';

@Injectable({ providedIn: 'root' })
export class ExpenseCategoryService {
  private apiUrl = `${environment.apiUrl}/expense-categories`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ExpenseCategory[]> {
    return this.http.get<ExpenseCategory[]>(this.apiUrl);
  }

  getActive(): Observable<ExpenseCategory[]> {
    return this.http.get<ExpenseCategory[]>(`${this.apiUrl}/active`);
  }

  getById(id: number): Observable<ExpenseCategory> {
    return this.http.get<ExpenseCategory>(`${this.apiUrl}/${id}`);
  }

  create(category: ExpenseCategory): Observable<ExpenseCategory> {
    return this.http.post<ExpenseCategory>(this.apiUrl, category);
  }

  update(id: number, category: ExpenseCategory): Observable<ExpenseCategory> {
    return this.http.put<ExpenseCategory>(`${this.apiUrl}/${id}`, category);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}