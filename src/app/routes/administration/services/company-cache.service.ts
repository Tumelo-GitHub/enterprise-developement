import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CompanyCacheService {
  private companyCache = new Map<number, { data: any, timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() { }

  setCompany(companyId: number, company: any): void {
    this.companyCache.set(companyId, {
      data: company,
      timestamp: Date.now()
    });
  }

  getCompany(companyId: number): any | null {
    const cached = this.companyCache.get(companyId);
    
    if (!cached) {
      return null;
    }

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.companyCache.delete(companyId);
      return null;
    }

    return cached.data;
  }

  clearCompany(companyId: number): void {
    this.companyCache.delete(companyId);
  }

  clearAll(): void {
    this.companyCache.clear();
  }
}
