<?php

namespace App\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class PaginationMeta
{
    /**
     * @param  LengthAwarePaginator<int, mixed>  $paginator
     * @return array{page: int, last_page: int, total: int}
     */
    public static function from(LengthAwarePaginator $paginator): array
    {
        return [
            'page' => $paginator->currentPage(),
            'last_page' => max($paginator->lastPage(), 1),
            'total' => $paginator->total(),
        ];
    }
}
