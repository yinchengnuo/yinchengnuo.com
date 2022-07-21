<script setup>
import { useRoute } from 'vitepress'

const { path } = useRoute()
</script>

# 敬请期待

{{ decodeURIComponent(path) }}
