import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, MapPin, DollarSign, Tag, Image, Plus, X } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { api } from '@/lib/api';

interface ServiceCategory {
  _id: string;
  name: string;
  description: string;
  icon?: string;
}

const cities = [
  "الدار البيضاء", "الرباط", "مراكش", "طنجة", "فاس", "أكادير", "مكناس", "وجدة",
  "القنيطرة", "تطوان", "سلا", "بني ملال", "خريبكة", "آسفي", "الجديدة"
];

export default function NewService() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    priceType: 'fixed', // fixed, hourly, daily
    location: '',
    cities: [] as string[],
    availability: {
      monday: { available: true, start: '09:00', end: '18:00' },
      tuesday: { available: true, start: '09:00', end: '18:00' },
      wednesday: { available: true, start: '09:00', end: '18:00' },
      thursday: { available: true, start: '09:00', end: '18:00' },
      friday: { available: true, start: '09:00', end: '18:00' },
      saturday: { available: true, start: '09:00', end: '18:00' },
      sunday: { available: false, start: '09:00', end: '18:00' },
    },
    tags: [] as string[],
    images: [] as File[],
    contactPhone: '',
    contactEmail: '',
    experience: '',
    certifications: [] as string[],
  });

  const [newTag, setNewTag] = useState('');
  const [newCertification, setNewCertification] = useState('');

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/service-categories');
        setServiceCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to some basic categories if API fails
        setServiceCategories([
          { _id: '1', name: 'السباكة', description: 'خدمات السباكة', icon: '🔧' },
          { _id: '2', name: 'الكهرباء', description: 'خدمات الكهرباء', icon: '⚡' },
          { _id: '3', name: 'التنظيف', description: 'خدمات التنظيف', icon: '🧹' },
          { _id: '4', name: 'الحدادة', description: 'خدمات الحدادة', icon: '🔨' },
        ]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvailabilityChange = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day as keyof typeof prev.availability],
          [field]: value
        }
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (certToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert !== certToRemove)
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      
      // Validate file sizes (max 2MB each)
      const maxSize = 2 * 1024 * 1024; // 2MB
      const validImages = newImages.filter(file => {
        if (file.size > maxSize) {
          alert(`File ${file.name} is too large. Maximum size is 2MB.`);
          return false;
        }
        return true;
      });
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validImages]
      }));
    }
  };

  // Function to compress image
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 800px width/height)
        const maxSize = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert images to compressed base64
      const imageUrls: string[] = [];
      
      if (formData.images.length > 0) {
        // Compress and convert files to base64
        for (const image of formData.images) {
          const compressedBase64 = await compressImage(image);
          imageUrls.push(compressedBase64);
        }
      }

      // Prepare the data for API submission
      const serviceData = {
        name: formData.title,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: 60,
        priceType: formData.priceType,
        location: formData.location,
        cities: formData.cities,
        availability: formData.availability,
        tags: formData.tags,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        experience: formData.experience,
        certifications: formData.certifications,
        images: imageUrls, // Add compressed images to the service data
      };

      // Send to backend API
      const response = await api.post('/services', serviceData);

      console.log('Service created successfully:', response.data);
      
      // Navigate to provider dashboard
      navigate('/provider/dashboard');
    } catch (error) {
      console.error('Error creating service:', error);
      // You can add toast notification here for error handling
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              إضافة خدمة جديدة
            </h1>
            <p className="text-lg text-gray-600">
              أضف خدمتك الجديدة وابدأ في جذب العملاء
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  المعلومات الأساسية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">عنوان الخدمة *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="مثال: إصلاح تسريبات المياه"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">فئة الخدمة *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingCategories ? "جاري التحميل..." : "اختر فئة الخدمة"} />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          <span className="ml-2">{category.icon}</span>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">وصف الخدمة *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="صف خدمتك بالتفصيل..."
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  التسعير
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">السعر *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="priceType">نوع السعر</Label>
                    <Select value={formData.priceType} onValueChange={(value) => handleInputChange('priceType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">سعر ثابت</SelectItem>
                        <SelectItem value="hourly">سعر بالساعة</SelectItem>
                        <SelectItem value="daily">سعر باليوم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  الموقع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location">الموقع الأساسي</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="مثال: الدار البيضاء"
                  />
                </div>

                <div>
                  <Label>المدن المتاحة للخدمة</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {cities.map((city) => (
                      <label key={city} className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="checkbox"
                          checked={formData.cities.includes(city)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                cities: [...prev.cities, city]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                cities: prev.cities.filter(c => c !== city)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{city}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  أوقات العمل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(formData.availability).map(([day, schedule]) => (
                  <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        checked={schedule.available}
                        onChange={(e) => handleAvailabilityChange(day, 'available', e.target.checked)}
                        className="rounded"
                      />
                      <span className="font-medium min-w-[80px]">
                        {day === 'monday' && 'الاثنين'}
                        {day === 'tuesday' && 'الثلاثاء'}
                        {day === 'wednesday' && 'الأربعاء'}
                        {day === 'thursday' && 'الخميس'}
                        {day === 'friday' && 'الجمعة'}
                        {day === 'saturday' && 'السبت'}
                        {day === 'sunday' && 'الأحد'}
                      </span>
                    </div>
                    
                    {schedule.available && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={schedule.start}
                          onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)}
                          className="w-24"
                        />
                        <span>إلى</span>
                        <Input
                          type="time"
                          value={schedule.end}
                          onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                          className="w-24"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>العلامات (Tags)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="أضف علامة جديدة"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  صور الخدمة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="images">إضافة صور</Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-2"
                  />
                </div>
                
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Service image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات التواصل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactPhone">رقم الهاتف</Label>
                    <Input
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      placeholder="+212 6XX XX XX XX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">البريد الإلكتروني</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      placeholder="example@email.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Experience & Certifications */}
            <Card>
              <CardHeader>
                <CardTitle>الخبرة والشهادات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="experience">سنوات الخبرة</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="مثال: 5"
                  />
                </div>

                <div>
                  <Label>الشهادات</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      placeholder="أضف شهادة جديدة"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                    />
                    <Button type="button" onClick={addCertification} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {cert}
                        <button
                          type="button"
                          onClick={() => removeCertification(cert)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/provider/dashboard')}
              >
                إلغاء
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                إضافة الخدمة
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 