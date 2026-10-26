import { h, nextTick, watch } from 'vue';
import DefaultTheme from 'vitepress/theme';
import { useData } from 'vitepress';
import { createMermaidRenderer } from 'vitepress-mermaid-renderer';

export default {
  extends: DefaultTheme,
  Layout: () => {
    const { isDark, localeIndex } = useData();

    const initMermaid = () => {
      const mermaidRenderer = createMermaidRenderer({
        theme: isDark.value ? 'dark' : 'forest',
      });
      mermaidRenderer.setToolbar({
        downloadFormat: 'svg',
        fullscreenMode: 'browser',
      });
    };

    nextTick(() => initMermaid());

    watch(
      () => [isDark.value, localeIndex.value],
      () => {
        initMermaid();
      },
    );

    return h(DefaultTheme.Layout);
  },
};
