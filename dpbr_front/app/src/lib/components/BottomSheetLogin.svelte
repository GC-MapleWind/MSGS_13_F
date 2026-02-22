<script lang="ts">
    import { onMount } from "svelte";
    import { env } from "$env/dynamic/public";
    import { X, MessageCircle } from "lucide-svelte";
    import InputBox from "$lib/components/InputBox.svelte";
    import Button from "$lib/components/Button.svelte";
    import Toast from "$lib/components/Toast.svelte";
    import { authStore, getSavedName } from "$lib/stores/auth";

    interface Props {
        onClose: () => void;
        onSuccess: () => void;
    }

    let { onClose, onSuccess }: Props = $props();

    let name = $state("");
    let studentId = $state("");
    let saveName = $state(false);
    let nameFocused = $state(false);
    let studentIdFocused = $state(false);
    let showToast = $state(false);
    let toastMessage = $state("이름 또는 학번을 확인해 주세요.");
    let isLoading = $state(false);
    let studentIdInputRef: HTMLDivElement | undefined = $state();

    // 애니메이션을 위한 상태
    let isVisible = $state(false);

    onMount(() => {
        // 약간의 딜레이를 주어 슬라이드 업 애니메이션 트리거
        setTimeout(() => {
            isVisible = true;
        }, 10);

        const savedName = getSavedName();
        if (savedName) {
            name = savedName;
        }
    });

    function handleClose(e?: Event) {
        e?.stopPropagation();
        // 닫힐 때 슬라이드 다운 애니메이션 트리거
        isVisible = false;
        setTimeout(() => {
            onClose();
        }, 300); // transition duration과 맞춤
    }

    async function handleLogin() {
        if (!name.trim() || !studentId.trim()) {
            showToastMessage();
            return;
        }

        isLoading = true;

        try {
            await authStore.login(name.trim(), studentId.trim(), saveName);
            // 로그인 성공 시 콜백 호출
            handleClose();
            setTimeout(() => {
                onSuccess();
            }, 300);
        } catch (error) {
            showToastMessage();
            studentId = "";
            studentIdFocused = true;
            setTimeout(() => {
                const input = studentIdInputRef?.querySelector("input");
                input?.focus();
            }, 0);
        } finally {
            isLoading = false;
        }
    }

    function handleKakaoLogin() {
        const kakaoClientId = env.PUBLIC_KAKAO_CLIENT_ID;
        const kakaoRedirectUri = env.PUBLIC_KAKAO_REDIRECT_URI;

        if (!kakaoClientId || !kakaoRedirectUri) {
            showToastMessage(
                "카카오 로그인 설정이 누락되었습니다. 관리자에게 문의해주세요.",
            );
            return;
        }

        const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${kakaoRedirectUri}&response_type=code`;
        window.location.href = KAKAO_AUTH_URL;
    }

    function showToastMessage(message?: string) {
        if (message) {
            toastMessage = message;
        }
        showToast = true;
    }

    function handleToastClose() {
        showToast = false;
    }

    // Focus/Blur 핸들러들
    function handleNameFocus() {
        nameFocused = true;
        studentIdFocused = false;
    }
    function handleNameBlur() {
        nameFocused = false;
    }
    function handleStudentIdFocus() {
        studentIdFocused = true;
        nameFocused = false;
    }
    function handleStudentIdBlur() {
        studentIdFocused = false;
    }
    function handleStudentIdClear() {
        studentId = "";
    }

    function handleNameKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            const input = studentIdInputRef?.querySelector("input");
            input?.focus();
        }
    }

    function handleStudentIdKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter" && studentId.length === 9) {
            e.preventDefault();
            handleLogin();
        }
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="absolute inset-0 z-50 flex flex-col justify-end bg-black/40 transition-opacity duration-300 {isVisible
        ? 'opacity-100'
        : 'opacity-0'}"
    onclick={handleClose}
>
    <!-- Toast 메시지 -->
    <Toast message={toastMessage} show={showToast} onClose={handleToastClose} />

    <div
        class="w-full h-[72%] bg-gradient-to-b from-[#FCDDA5] to-[#F1A470] rounded-t-3xl pt-4 pb-8 px-6 flex flex-col items-center shadow-lg transition-transform duration-300 {isVisible
            ? 'translate-y-0'
            : 'translate-y-full'}"
        onclick={(e) => e.stopPropagation()}
    >
        <!-- 닫기 버튼 -->
        <div class="w-full flex justify-end">
            <button onclick={handleClose} class="text-white p-2">
                <X size={24} />
            </button>
        </div>

        <!-- 모달 컨텐츠 -->
        <div class="w-full max-w-md flex flex-col items-center mt-2">
            <!-- 앱 타이틀 -->
            <h1
                class="text-3xl font-bold text-white tracking-widest drop-shadow-md mb-8"
            >
                단풍바람
            </h1>

            <!-- 입력 폼 -->
            <div class="w-full flex flex-col gap-4">
                <!-- 입력 필드 그룹 -->
                <div class="flex flex-col gap-[2px]">
                    <!-- 이름 입력 -->
                    <InputBox
                        type="text"
                        placeholder="이름"
                        value={name}
                        maxLength={3}
                        inputState={nameFocused ? "focused" : "default"}
                        showClearButton={false}
                        onInput={(value) => (name = value)}
                        onFocus={handleNameFocus}
                        onBlur={handleNameBlur}
                        onKeyDown={handleNameKeyDown}
                        class="rounded-lg bg-[#F1A470] border border-[#F87C56] text-white placeholder-white"
                    />

                    <!-- 학번 입력 -->
                    <div bind:this={studentIdInputRef} class="mt-2">
                        <InputBox
                            type="tel"
                            placeholder="학번"
                            value={studentId}
                            maxLength={9}
                            inputState={studentIdFocused
                                ? "focused"
                                : "default"}
                            showClearButton={true}
                            onInput={(value) => (studentId = value)}
                            onFocus={handleStudentIdFocus}
                            onBlur={handleStudentIdBlur}
                            onClear={handleStudentIdClear}
                            onKeyDown={handleStudentIdKeyDown}
                            class="rounded-lg bg-[#F1A470] border border-[#F87C56] text-white placeholder-white"
                        />
                    </div>
                </div>

                <!-- 로그인 버튼 -->
                <Button
                    label="메생결산 톡 입장"
                    variant="primary"
                    buttonState={isLoading ? "disabled" : "default"}
                    onClick={handleLogin}
                    type="button"
                    class="bg-white text-[#F87C56] hover:bg-white/90 font-medium py-[14px] mt-2 rounded-lg"
                />

                <!-- 이름 저장 체크박스 -->
                <label class="flex items-center gap-2 cursor-pointer mt-1 mb-2">
                    <div
                        class="relative flex items-center justify-center w-5 h-5"
                    >
                        <input
                            type="checkbox"
                            bind:checked={saveName}
                            class="w-full h-full rounded-full border border-white appearance-none checked:bg-transparent checked:border-white transition-all cursor-pointer"
                            aria-label="이름 저장"
                        />
                        {#if saveName}
                            <svg
                                class="absolute w-3 h-3 text-white pointer-events-none"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="3"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        {/if}
                    </div>
                    <span class="text-white text-sm font-light">이름 저장</span>
                </label>

                <!-- 구분선 -->
                <div class="w-full h-px bg-white/30 my-2"></div>

                <!-- 카카오 로그인 버튼 -->
                <button
                    onclick={handleKakaoLogin}
                    class="w-full py-3 px-4 rounded-lg font-medium text-base transition-all bg-[#FEE500] text-black hover:bg-[#FDD835] border-none flex items-center justify-center gap-2"
                >
                    <!-- 카카오 로고 대신 MessageCircle 사용 -->
                    <MessageCircle size={18} fill="black" class="text-black" />
                    <span>카카오 로그인</span>
                </button>
            </div>

            <!-- 푸터 안내문구 -->
            <div class="mt-12 mb-4 flex justify-center">
                <p class="text-white text-sm font-light text-center">
                    단풍바람 회원이 이용 가능한 서비스입니다.
                </p>
            </div>
        </div>
    </div>
</div>
