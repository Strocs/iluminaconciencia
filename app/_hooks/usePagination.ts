'use client'

import { parseAsIndex, useQueryState } from 'nuqs'

export type UsePaginationOptions = {
  totalItems: number
  pageSize: number
}

export type Pagination = {
  page: number
  pageCount: number
  startIndex: number
  endIndex: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  setPage: (page: number) => Promise<void>
  previousPage: () => Promise<void>
  nextPage: () => Promise<void>
}

export function usePagination({ totalItems, pageSize }: UsePaginationOptions): Pagination {
  const [pageIndex, setPageIndex] = useQueryState(
    'pagina',
    parseAsIndex.withDefault(0).withOptions({ history: 'push' })
  )

  const itemCount = Math.max(0, totalItems)
  const pageCount = Math.ceil(itemCount / pageSize)
  const lastPageIndex = Math.max(pageCount - 1, 0)
  const effectivePageIndex = Math.min(Math.max(pageIndex, 0), lastPageIndex)
  const startIndex = Math.min(effectivePageIndex * pageSize, itemCount)
  const endIndex = Math.min(startIndex + pageSize, itemCount)
  const hasPreviousPage = itemCount > 0 && effectivePageIndex > 0
  const hasNextPage = itemCount > 0 && effectivePageIndex < lastPageIndex

  async function setPage(page: number) {
    if (pageCount === 0) return

    const nextPageIndex = Math.min(Math.max(page - 1, 0), lastPageIndex)
    await setPageIndex(nextPageIndex)
  }

  async function previousPage() {
    if (hasPreviousPage) await setPageIndex(effectivePageIndex - 1)
  }

  async function nextPage() {
    if (hasNextPage) await setPageIndex(effectivePageIndex + 1)
  }

  return {
    page: effectivePageIndex + 1,
    pageCount,
    startIndex,
    endIndex,
    hasPreviousPage,
    hasNextPage,
    setPage,
    previousPage,
    nextPage
  }
}
