import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const serviceSchema = z.object({
  name: z.string().min(3, 'اسم الخدمة يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'السعر يجب أن يكون رقماً موجباً',
  }),
  duration: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'المدة يجب أن تكون رقماً موجباً',
  }),
  isPopular: z.boolean().default(false),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface AddServiceFormProps {
  providerId: string;
  onSuccess?: () => void;
}

export function AddServiceForm({ providerId, onSuccess }: AddServiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      isPopular: false,
    },
  });

  const onSubmit = async (data: ServiceFormData) => {
    try {
      setIsSubmitting(true);
      await api.post(`/service-providers/${providerId}/services`, {
        ...data,
        price: Number(data.price),
        duration: Number(data.duration),
      });
      
      toast({
        title: 'تمت إضافة الخدمة بنجاح',
        description: 'تم إضافة الخدمة الجديدة إلى قائمة خدماتك',
      });
      
      reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'حدث خطأ',
        description: 'لم نتمكن من إضافة الخدمة. يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إضافة خدمة جديدة</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">اسم الخدمة</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="أدخل اسم الخدمة"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف الخدمة</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="أدخل وصفاً تفصيلياً للخدمة"
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">السعر (درهم)</Label>
              <Input
                id="price"
                type="number"
                {...register('price')}
                placeholder="0"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">المدة (دقائق)</Label>
              <Input
                id="duration"
                type="number"
                {...register('duration')}
                placeholder="0"
                className={errors.duration ? 'border-red-500' : ''}
              />
              {errors.duration && (
                <p className="text-sm text-red-500">{errors.duration.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              id="isPopular"
              {...register('isPopular')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <Label htmlFor="isPopular">تعيين كخدمة شائعة</Label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جاري الإضافة...' : 'إضافة الخدمة'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 