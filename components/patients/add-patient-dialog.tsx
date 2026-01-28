'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { PatientForm } from './patient-form';

interface AddPatientDialogProps {
	insurers: { id: string; name: string }[];
	doctors: { id: string; lastName: string; firstName: string }[];
}

export function AddPatientDialog({
	insurers,
	doctors,
}: AddPatientDialogProps) {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	const handleSuccess = () => {
		setOpen(false);
		router.refresh();
	};

	const handleCancel = () => {
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm">
					<PlusCircle className='h-4 w-4' />
					Nuevo Paciente
				</Button>
			</DialogTrigger>
			<DialogContent className="md:max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Registrar Nuevo Paciente</DialogTitle>
					<DialogDescription>
						Ingresa los datos personales y de afiliación del paciente.
					</DialogDescription>
				</DialogHeader>

				<PatientForm
					insurers={insurers}
					doctors={doctors}
					onSuccess={handleSuccess}
					onCancel={handleCancel}
				/>
			</DialogContent>
		</Dialog>
	);
}
