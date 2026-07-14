import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private apiUrl = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) {}

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl);
  }

  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  createCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, this.buildCustomerPayload(customer));
  }

  createCustomerWithPhoto(customer: Customer, photo?: File | null): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, this.buildCustomerFormData(customer, photo));
  }

  updateCustomer(id: number, customer: Customer, photo?: File | null): Observable<Customer> {
    if (photo) {
      return this.http.put<Customer>(`${this.apiUrl}/${id}`, this.buildCustomerFormData(customer, photo));
    }
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, customer);
  }

  updateCustomerWithPhoto(id: number, customer: Customer, photo?: File | null): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, this.buildCustomerFormData(customer, photo));
  }

  getCustomerPhotoUrl(photoUrl?: string | null): string {
    if (!photoUrl) return '';
    if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
    const apiRoot = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${apiRoot}${photoUrl.startsWith('/') ? photoUrl : '/' + photoUrl}`;
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private buildCustomerFormData(customer: Customer, photo?: File | null): FormData {
    const formData = new FormData();
    formData.append('customer', new Blob([JSON.stringify(this.buildCustomerPayload(customer))], { type: 'application/json' }), 'customer.json');
    if (photo) {
      formData.append('photo', photo);
    }
    return formData;
  }

  private buildCustomerPayload(customer: Customer): Partial<Customer> {
    return {
      customerCode: customer.customerCode,
      customerName: customer.customerName,
      customerType: customer.customerType,
      email: customer.email,
      phone: customer.phone,
      mobile: customer.mobile,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      postalCode: customer.postalCode,
      country: customer.country,
      creditLimit: customer.creditLimit,
      openingBalance: customer.openingBalance,
      currentBalance: customer.currentBalance,
      gstNumber: customer.gstNumber,
      photoUrl: customer.photoUrl,
      status: customer.status
    };
  }
}
