import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { GlobalSearchItem, GlobalSearchService } from 'src/app/services/global-search.service';
import { TranslateService } from '@ngx-translate/core';

interface SearchGroup {
  label: string;
  icon: string;
  items: GlobalSearchItem[];
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy {
  query = '';
  loading = false;
  errorMessage = '';
  helperMessage = '';
  groups: SearchGroup[] = [];
  totalResults = 0;

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private globalSearchService: GlobalSearchService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.query = (params.get('q') || '').trim();
        this.search$.next(this.query);
      });

    this.search$
      .pipe(debounceTime(160), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(keyword => this.runSearch(keyword));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(): void {
    const keyword = this.query.trim();
    if (!keyword) return;
    this.router.navigate(['/search'], { queryParams: { q: keyword } });
  }

  openResult(result: GlobalSearchItem): void {
    if (!result.route) return;
    this.router.navigateByUrl(result.route);
  }

  private runSearch(keyword: string): void {
    this.errorMessage = '';
    this.helperMessage = '';
    this.groups = [];
    this.totalResults = 0;

    if (!keyword) return;
    if (keyword.length < 2) {
      this.helperMessage = this.translate.instant('COMMON.TYPE_AT_LEAST_2');
      return;
    }

    this.loading = true;
    this.globalSearchService.search(keyword).subscribe({
      next: response => {
        this.groups = this.buildGroups(response);
        this.totalResults = this.groups.reduce((total, group) => total + group.items.length, 0);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = this.translate.instant('COMMON.SEARCH_FAILED');
      }
    });
  }

  private buildGroups(results: GlobalSearchItem[]): SearchGroup[] {
    return this.globalSearchService.groupByModule(results)
      .map(group => ({
        label: group.module,
        icon: this.groupIcon(group.items[0]),
        items: group.items
      }));
  }

  private groupIcon(result?: GlobalSearchItem): string {
    return result?.icon ? `bi ${result.icon}` : 'bi bi-search';
  }
}
