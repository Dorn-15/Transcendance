// app/login/page.tsx
import { Suspense } from 'react';
import LogIn from '../../components/views/LogIn';

export default function LoginPage() {
	return (
		<main>
			<Suspense fallback={null}>
				<LogIn />
			</Suspense>
		</main>
	);
}
