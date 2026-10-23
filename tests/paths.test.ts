import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { rewritePath, stripSortPrefixes } from '../paths.ts'

describe('stripSortPrefixes', () => {

    it('удаляет префиксы сортировки у каталогов и файлов', () => {
        assert.equal(
            stripSortPrefixes('products/003-extends/020-usage.md'),
            'products/extends/usage.md'
        )
    })

    it('не трогает цифры с дефисом внутри имени', () => {
        assert.equal(
            stripSortPrefixes('products/011-opentelemetry-v8-logs/020-configuration.md'),
            'products/opentelemetry-v8-logs/configuration.md'
        )
    })

    it('понимает обратные слеши Windows', () => {
        assert.equal(
            stripSortPrefixes('api\\011-opentelemetry-v8-logs\\010-index.md'),
            'api\\opentelemetry-v8-logs\\index.md'
        )
    })

})

describe('rewritePath', () => {

    it('публикует продукт без префикса products', () => {
        assert.equal(
            rewritePath('products/011-opentelemetry-v8-logs/020-configuration.md'),
            'opentelemetry-v8-logs/configuration.md'
        )
    })

    it('публикует autumn в корне сайта', () => {
        assert.equal(
            rewritePath('products/000-autumn/010-getting-started.md'),
            'getting-started.md'
        )
    })

    it('сохраняет имя репозитория в API', () => {
        assert.equal(
            rewritePath('api/011-opentelemetry-v8-logs/Ядро/Класс.md'),
            'api/opentelemetry-v8-logs/Ядро/Класс.md'
        )
    })

    it('заменяет обратные слеши на прямые', () => {
        assert.equal(
            rewritePath('products\\011-opentelemetry-v8-logs\\010-index.md'),
            'opentelemetry-v8-logs/index.md'
        )
    })

    it('не переписывает одностраничную документацию', () => {
        assert.equal(rewritePath('single-page/api/opentelemetry-v8-logs.md'), 'single-page/api/opentelemetry-v8-logs.md')
        assert.equal(rewritePath('single-page/opentelemetry-v8-logs.md'), 'single-page/opentelemetry-v8-logs.md')
    })

})
