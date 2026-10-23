/**
 * Пути страниц на сайте.
 *
 * Каталоги и файлы документации начинаются с префикса сортировки
 * (`011-opentelemetry-v8-logs/020-configuration.md`), который в адрес
 * страницы не попадает.
 */

const SORT_PREFIX = /(^|[\\/])\d+-/g;

export function stripSortPrefixes(filePath: string): string {
    // Префикс есть только в начале сегмента пути: в `v8-logs` цифра с дефисом - часть имени.
    return filePath.replace(SORT_PREFIX, '$1');
}

export function rewritePath(id: string): string {
    if (id.includes('single-page/')) {
        return id;
    }

    return stripSortPrefixes(id)
        .replaceAll('\\', '/')               // замена обратных виндовых слешей на прямые
        .replaceAll('products/autumn/', '')  // подмена пути products/autumn на корень
        .replaceAll('products/', '');        // удаление префикса products
}
