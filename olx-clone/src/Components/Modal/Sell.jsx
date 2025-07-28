import { Modal, ModalBody } from "flowbite-react"
import { useState } from "react"
import Input from "../Input/Input"
import { UserAuth } from "../../Context/Auth"
import { addDoc, collection } from "firebase/firestore"
import { fetchFromFirestore, fireStore } from "../Firebase/Firebase"
import fileUpload from '../../assets/fileUpload.svg'
import loading from '../../assets/loading.gif'
import close from '../../assets/close.svg'

const Sell = (props) => {  
    const {toggleModalSell, status, setItems} = props

    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('')
    const [price, setPrice] = useState('')
    const [description, setDescription] = useState('')
    const [image, setImage] = useState(null)

    const [submitting, setSubmitting] = useState(false)
    
    // Error states for validation
    const [errors, setErrors] = useState({
        title: '',
        category: '',
        price: '',
        description: '',
        image: ''
    })

    const auth = UserAuth();

    // Validation functions
    const validateTitle = (value) => {
        const trimmed = value.trim();
        if (!trimmed) {
            return 'Title is required';
        }
        if (trimmed.length < 3) {
            return 'Title must be at least 3 characters long';
        }
        if (trimmed.length > 100) {
            return 'Title must be less than 100 characters';
        }
        return '';
    };

    const validateCategory = (value) => {
        const trimmed = value.trim();
        if (!trimmed) {
            return 'Category is required';
        }
        if (trimmed.length < 2) {
            return 'Category must be at least 2 characters long';
        }
        if (trimmed.length > 50) {
            return 'Category must be less than 50 characters';
        }
        return '';
    };

    const validatePrice = (value) => {
        const trimmed = value.trim();
        if (!trimmed) {
            return 'Price is required';
        }
        
        const numericValue = parseFloat(trimmed);
        if (isNaN(numericValue)) {
            return 'Price must be a valid number';
        }
        if (numericValue <= 0) {
            return 'Price must be greater than 0';
        }
        if (numericValue > 10000000) {
            return 'Price must be less than 1 crore';
        }
        
        // Check for more than 2 decimal places
        if (trimmed.includes('.') && trimmed.split('.')[1].length > 2) {
            return 'Price can have maximum 2 decimal places';
        }
        
        return '';
    };

    const validateDescription = (value) => {
        const trimmed = value.trim();
        if (!trimmed) {
            return 'Description is required';
        }
        if (trimmed.length < 10) {
            return 'Description must be at least 10 characters long';
        }
        if (trimmed.length > 1000) {
            return 'Description must be less than 1000 characters';
        }
        return '';
    };

    const validateImage = (file) => {
        if (!file) {
            return 'Image is required';
        }
        
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            return 'Only JPG, PNG, and SVG files are allowed';
        }
        
        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            return 'Image size must be less than 5MB';
        }
        
        return '';
    };

    // Real-time validation handlers
    const handleTitleChange = (value) => {
        setTitle(value);
        const error = validateTitle(value);
        setErrors(prev => ({ ...prev, title: error }));
    };

    const handleCategoryChange = (value) => {
        setCategory(value);
        const error = validateCategory(value);
        setErrors(prev => ({ ...prev, category: error }));
    };

    const handlePriceChange = (value) => {
        // Allow only numbers and decimal point
        const sanitizedValue = value.replace(/[^0-9.]/g, '');
        setPrice(sanitizedValue);
        const error = validatePrice(sanitizedValue);
        setErrors(prev => ({ ...prev, price: error }));
    };

    const handleDescriptionChange = (value) => {
        setDescription(value);
        const error = validateDescription(value);
        setErrors(prev => ({ ...prev, description: error }));
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const error = validateImage(file);
            setErrors(prev => ({ ...prev, image: error }));
            
            if (!error) {
                setImage(file);
            } else {
                setImage(null);
                event.target.value = ''; // Clear the input
            }
        }
    };

    // Form validation
    const validateForm = () => {
        const titleError = validateTitle(title);
        const categoryError = validateCategory(category);
        const priceError = validatePrice(price);
        const descriptionError = validateDescription(description);
        const imageError = validateImage(image);

        setErrors({
            title: titleError,
            category: categoryError,
            price: priceError,
            description: descriptionError,
            image: imageError
        });

        return !titleError && !categoryError && !priceError && !descriptionError && !imageError;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!auth?.user) {
            alert('Please login to continue');
            return;
        }

        // Validate form before submission
        if (!validateForm()) {
            alert('Please fix all validation errors before submitting');
            return;
        }

        setSubmitting(true);

        // const readImageAsDataUrl = (file) => {
        //     return new Promise((resolve, reject) => {
        //         const reader = new FileReader();
        //         reader.onloadend = () => {
        //             const imageUrl = reader.result;
        //             localStorage.setItem(`image_${file.name}`, imageUrl);
        //             resolve(imageUrl);
        //         };
        //         reader.onerror = reject;
        //         reader.readAsDataURL(file);
        //     });
        // };


         const readImageAsDataUrl = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        let imageUrl = '';
        if (image) {
            try {
                imageUrl = await readImageAsDataUrl(image);
            } catch (error) {
                console.log(error);
                alert('Failed to read image');
                setSubmitting(false);
                return;
            }
        }

        try {
            await addDoc(collection(fireStore, 'products'), {
                title: title.trim(),
                category: category.trim(),
                price: parseFloat(price.trim()),
                description: description.trim(),
                imageUrl,
                userId: auth.user.uid,
                userEmail: auth.user.email, // Add user email for better ownership tracking
                userName: auth.user.displayName || 'Anonymous',
                createdAt: new Date().toISOString(), // Use ISO string for better date handling
            });

            // Reset form
             const datas = await fetchFromFirestore();
            setItems(datas);
            toggleModalSell();
            alert('Item listed successfully!');
            
            setTitle('');
            setCategory('');
            setPrice('');
            setDescription('');
            setImage(null);
            setErrors({
                title: '',
                category: '',
                price: '',
                description: '',
                image: ''
            });

           
            
        } catch (error) {
            console.log(error);
            alert('Failed to add item to the firestore');
        } finally {
            setSubmitting(false);
        }
    };

    const closeModal = () => {
        // Reset form when closing
        setTitle('');
        setCategory('');
        setPrice('');
        setDescription('');
        setImage(null);
        setErrors({
            title: '',
            category: '',
            price: '',
            description: '',
            image: ''
        });
        toggleModalSell();
    };

    // Check if form has any errors
    const hasErrors = Object.values(errors).some(error => error !== '');
    const isFormValid = title.trim() && category.trim() && price.trim() && description.trim() && image && !hasErrors;

    return (
        <div>
            <Modal  
                theme={{
                    "content": {
                        "base": "relative w-full p-4 md:h-auto",
                        "inner": "relative flex max-h-[90dvh] flex-col rounded-lg bg-white shadow dark:bg-gray-700"
                    },
                }}  
                onClick={closeModal} 
                show={status}  
                className="bg-black"  
                position={'center'}  
                size="md" 
                popup={true}
            >
                <ModalBody className="bg-white h-auto max-h-[90vh] overflow-y-auto p-0 rounded-md" onClick={(event) => event.stopPropagation()}>
                    <img 
                        onClick={closeModal}
                        className="w-6 absolute z-10 top-6 right-8 cursor-pointer"
                        src={close} alt="Close" 
                    />
                   
                    <div className="p-6 pl-8 pr-8 pb-8">
                        <p className="font-bold text-lg mb-3">Sell Item</p>

                        <form onSubmit={handleSubmit}>
                            {/* Title Input */}
                            <div className="mb-4">
                                <Input 
                                    setInput={handleTitleChange} 
                                    placeholder='Title' 
                                    value={title}
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>

                            {/* Category Input */}
                            <div className="mb-4">
                                <Input 
                                    setInput={handleCategoryChange} 
                                    placeholder='Category'
                                    value={category}
                                />
                                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                            </div>

                            {/* Price Input */}
                            <div className="mb-4">
                                <Input 
                                    setInput={handlePriceChange} 
                                    placeholder='Price (₹)'
                                    value={price}
                                />
                                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                            </div>

                            {/* Description Input */}
                            <div className="mb-4">
                                <Input 
                                    setInput={handleDescriptionChange} 
                                    placeholder='Description'
                                    value={description}
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                <p className="text-gray-500 text-xs mt-1">
                                    {description.length}/1000 characters
                                </p>
                            </div>

                            {/* Image Upload */}
                            <div className="pt-2 w-full relative mb-4">
                                {image ? (
                                    <div className="relative h-40 sm:h-60 w-full flex justify-center border-2 border-black border-solid rounded-md overflow-hidden">
                                        <img className="object-contain" src={URL.createObjectURL(image)} alt="Preview" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImage(null);
                                                setErrors(prev => ({ ...prev, image: 'Image is required' }));
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative h-40 sm:h-60 w-full border-2 border-black border-solid rounded-md">
                                        <input
                                            onChange={handleImageUpload}
                                            type="file" 
                                            className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-30"
                                            accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                                        />

                                        <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex flex-col items-center">
                                            <img className="w-12" src={fileUpload} alt="" />
                                            <p className="text-center text-sm pt-2">Click to upload images</p>
                                            <p className="text-center text-sm pt-1">SVG, PNG, JPG (Max 5MB)</p>
                                        </div>
                                    </div>
                                )}
                                {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                            </div>

                            {submitting ? (
                                <div className="w-full flex h-14 justify-center pt-4 pb-2">
                                    <img className="w-32 object-cover" src={loading} alt="" />
                                </div>
                            ) : (
                                <div className="w-full pt-2">
                                    <button  
                                        type="submit"
                                        disabled={!isFormValid}
                                        className={`w-full p-3 rounded-lg text-white transition-colors ${
                                            isFormValid 
                                                ? 'bg-[#002f34] hover:bg-[#001a1d]' 
                                                : 'bg-gray-400 cursor-not-allowed'
                                        }`}
                                    > 
                                        Sell Item 
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default Sell