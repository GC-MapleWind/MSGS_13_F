<script lang="ts">
    interface Props {
        title: string;
        cancelText?: string;
        confirmText?: string;
        onConfirm: () => void;
        onCancel: () => void;
    }

    let {
        title,
        cancelText = "거절",
        confirmText = "확인",
        onConfirm,
        onCancel,
    }: Props = $props();

    function handleContainerClick(e: Event) {
        e.stopPropagation();
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    onclick={onCancel}
>
    <div
        class="w-[272px] bg-white rounded-2xl flex flex-col items-center"
        onclick={handleContainerClick}
    >
        <!-- 타이틀 영역 -->
        <div class="px-6 pt-8 pb-6 w-full text-center">
            <p
                class="text-[#292e33] font-medium"
                style="font-size: 16px; line-height: 1.5;"
            >
                {title}
            </p>
        </div>

        <!-- 버튼 영역 -->
        <div class="flex w-full px-4 pb-4 gap-2">
            <button
                onclick={onCancel}
                class="flex-1 py-[10px] rounded-lg bg-[#edf1f5] text-[#525c66] font-medium transition-opacity active:opacity-80"
                style="font-size: 14px; line-height: 1.5;"
            >
                {cancelText}
            </button>
            <button
                onclick={onConfirm}
                class="flex-1 py-[10px] rounded-lg bg-[#f87c56] text-white font-medium transition-opacity active:opacity-80"
                style="font-size: 14px; line-height: 1.5;"
            >
                {confirmText}
            </button>
        </div>
    </div>
</div>
