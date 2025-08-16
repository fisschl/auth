<script setup lang="ts">
import { object, string, minLength, email, type infer as Infer } from "zod/mini";

useHead({
  title: "登录",
});

const toast = useToast();

// 表单状态
const formState = ref<LoginCredentials>({
  email: "",
  password: "",
});

// 密码显示状态
const showPassword = ref(false);

// 使用 zod/mini 进行表单验证
const schema = object({
  email: string().check(minLength(1, "请输入邮箱"), email("请输入有效的邮箱地址")),
  password: string().check(minLength(6, "密码长度不能少于6位")),
});

// 从 schema 推断类型
type LoginCredentials = Infer<typeof schema>;

// 使用 useMutation 管理登录状态
const { mutate: login, asyncStatus } = useMutation({
  mutation: async (credentials: LoginCredentials) => {
    const response = await $fetch("/api/user/login", {
      baseURL: "/auth",
      method: "POST",
      body: credentials,
    });
    return response;
  },
  onSuccess: () => {
    toast.add({
      title: "登录成功",
      description: "正在跳转...",
      color: "success",
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "登录失败",
      description: error.response?.data?.message || "邮箱或密码错误",
      color: "error",
    });
  },
});

// 登录处理函数
const handleSubmit = () => {
  login(formState.value);
};
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
    <UCard class="w-full max-w-md">
      <UForm :schema="schema" :state="formState" class="space-y-6" @submit="handleSubmit">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">登录</h2>
        <!-- 邮箱输入 -->
        <UFormField name="email" label="邮箱">
          <UInput
            v-model="formState.email"
            type="email"
            placeholder="请输入邮箱"
            icon="i-lucide-mail"
            :disabled="asyncStatus === 'loading'"
          />
        </UFormField>

        <!-- 密码输入 -->
        <UFormField name="password" label="密码">
          <UInput
            v-model="formState.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
            icon="i-lucide-key"
            :disabled="asyncStatus === 'loading'"
          >
            <template #trailing>
              <UButton
                type="button"
                color="neutral"
                variant="link"
                :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                class="h-auto p-0"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <p class="flex text-sm text-gray-600 dark:text-gray-400">
          还没有账号?
          <a
            href="#"
            class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            立即注册
          </a>
        </p>

        <!-- 登录按钮 -->
        <UButton
          type="submit"
          class="w-full"
          :loading="asyncStatus === 'loading'"
          icon="i-lucide-login"
        >
          {{ asyncStatus === "loading" ? "登录中..." : "登录" }}
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>
