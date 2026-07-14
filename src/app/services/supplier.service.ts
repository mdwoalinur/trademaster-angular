import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier } from '../models/supplier.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private apiUrl = `${environment.apiUrl}/suppliers`;

  constructor(private http: HttpClient) {}

  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.apiUrl);
  }

  getSupplierById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/${id}`);
  }

  createSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, this.toSupplierPayload(supplier));
  }

  createSupplierWithPhoto(supplier: Supplier, photo?: File | null): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, this.buildSupplierFormData(supplier, photo || null));
  }

  updateSupplier(id: number, supplier: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.apiUrl}/${id}`, this.toSupplierPayload(supplier));
  }

  updateSupplierWithPhoto(id: number, supplier: Supplier, photo?: File | null): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.apiUrl}/${id}`, this.buildSupplierFormData(supplier, photo || null));
  }

  deleteSupplier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getSupplierPhotoUrl(photoUrl?: string | null): string {
    if (!photoUrl) return '';
    if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
    const apiRoot = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${apiRoot}${photoUrl.startsWith('/') ? photoUrl : '/' + photoUrl}`;
  }

  private buildSupplierFormData(supplier: Partial<Supplier>, photo: File | null): FormData {
    const formData = new FormData();
    formData.append('supplier', new Blob([JSON.stringify(this.toSupplierPayload(supplier))], { type: 'application/json' }));
    if (photo) {
      formData.append('photo', photo);
    }
    return formData;
  }

  private toSupplierPayload(supplier: Partial<Supplier>): Partial<Supplier> {
    const payload: Partial<Supplier> = {
      supplierCode: supplier.supplierCode || '',
      supplierName: supplier.supplierName || '',
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      city: supplier.city || '',
      state: supplier.state || '',
      postalCode: supplier.postalCode || '',
      country: supplier.country || '',
      paymentTerms: supplier.paymentTerms || '',
      gstNumber: supplier.gstNumber || '',
      status: supplier.status !== false
    };

    if (supplier.photoUrl === '') {
      payload.photoUrl = '';
    }

    return payload;
  }
}
