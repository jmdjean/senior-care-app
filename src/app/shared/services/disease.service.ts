import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrls } from '../urls';

export type Disease = {
  id: number;
  name: string;
};

@Injectable({
  providedIn: 'root'
})
export class DiseaseService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Disease[]> {
    return this.http.get<Disease[]>(apiUrls.disease);
  }
}
