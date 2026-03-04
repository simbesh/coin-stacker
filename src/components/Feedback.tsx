import { CheckCircle, MessageCircleHeart, Send } from 'lucide-react'
import posthog from 'posthog-js'
import { type FormEvent, useEffect, useState } from 'react'
import { RiGithubLine } from 'react-icons/ri'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

const Feedback = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [contactFormData, setContactFormData] = useState({
        title: '',
        email: '',
        message: '',
    })
    const [status, setStatus] = useState<string>()

    useEffect(() => {
        if (!open) {
            // allow for dialog to close (animation) before resetting status
            setTimeout(() => {
                setStatus(undefined)
            }, 1000)
        }
    }, [open])

    function handleContact(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        posthog.capture('submit-feedback', contactFormData)
        setIsLoading(true)
        fetch('api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactFormData),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setStatus('success')
                } else {
                    setStatus('error')
                }
            })
            .catch(() => {
                setStatus('error')
            })
            .finally(() => {
                setContactFormData({
                    title: '',
                    email: '',
                    message: '',
                })
                setIsLoading(false)
            })
    }

    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogTrigger asChild>
                <Button
                    aria-label="Open Feedback Dialog"
                    className={'group gap-2 text-base'}
                    onClick={() => posthog.capture('open-feedback')}
                    variant={'ghost'}
                >
                    <MessageCircleHeart className={'size-5 transition-color duration-200 group-hover:text-primary'} />
                    <span className={''}>Feedback</span>
                </Button>
            </DialogTrigger>
            <DialogContent
                className="h-fit bg-card transition-all duration-1000 sm:max-w-[425px]"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                {status ? (
                    <FeedbackResponse closeDialog={() => setOpen(false)} />
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Feedback / Contact</DialogTitle>
                            <DialogDescription>Select a method of contact below.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right" htmlFor="name">
                                    Github
                                </Label>
                                <Button
                                    aria-label="Create Github Issue"
                                    asChild
                                    className={'col-span-3'}
                                    variant={'link'}
                                >
                                    <a
                                        className={'flex gap-2'}
                                        href={'https://github.com/simbesh/coin-stacker/issues/new'}
                                        onClick={() => posthog.capture('feedback-github-issue')}
                                        rel="noopener"
                                        target={'_blank'}
                                    >
                                        <RiGithubLine className={'size-5'} />
                                        Create Issue
                                    </a>
                                </Button>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right" htmlFor="name">
                                    Telegram
                                </Label>
                                <Button
                                    aria-label="Open Telegram Chat"
                                    asChild
                                    className={'col-span-3'}
                                    variant={'link'}
                                >
                                    <a
                                        className={'flex gap-2'}
                                        href={process.env.NEXT_PUBLIC_TELEGRAM_GROUP_URL}
                                        onClick={() => posthog.capture('feedback-telegram-group')}
                                        target={'_blank'}
                                    >
                                        <Send className={'size-5'} />
                                        Open Chat
                                    </a>
                                </Button>
                            </div>
                            <div className="my-2 flex w-full items-center justify-center gap-2">
                                <span className="text-muted-foreground text-sm">- or -</span>
                            </div>
                            <form className={'mx-2'} onSubmit={handleContact}>
                                <div className="space-y-2">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        {/*<Label htmlFor="name" className="text-right">*/}
                                        {/*    Title <span className={'text-muted-foreground'}>(optional)</span>*/}
                                        {/*</Label>*/}
                                        <Input
                                            className="col-span-4"
                                            id="title"
                                            onChange={(e) =>
                                                setContactFormData((prev) => ({ ...prev, title: e.target.value }))
                                            }
                                            placeholder="Title (optional)"
                                            value={contactFormData.title}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        {/*<Label htmlFor="username" className="text-right">*/}
                                        {/*    Email <span className={'text-muted-foreground'}>(optional)</span>*/}
                                        {/*</Label>*/}
                                        <Input
                                            className="col-span-4"
                                            id="email"
                                            onChange={(e) =>
                                                setContactFormData((prev) => ({ ...prev, email: e.target.value }))
                                            }
                                            placeholder="Email (optional)"
                                            type="email"
                                            value={contactFormData.email}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        {/*<Label htmlFor="username" className="text-right">*/}
                                        {/*    Message <span className={'font-bold text-red-500'}>*</span>*/}
                                        {/*</Label>*/}
                                        <Textarea
                                            className="col-span-4 bg-card"
                                            onChange={(e) =>
                                                setContactFormData((prev) => ({ ...prev, message: e.target.value }))
                                            }
                                            placeholder="Type your message here.*"
                                            value={contactFormData.message}
                                        />
                                    </div>
                                </div>
                                <Button
                                    aria-label="Send Feedback"
                                    className={'mt-6 w-full'}
                                    disabled={contactFormData.message === ''}
                                    isLoading={isLoading}
                                    type="submit"
                                >
                                    Send
                                </Button>
                            </form>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

function FeedbackResponse({ closeDialog }: { closeDialog: () => void }) {
    return (
        <>
            <DialogHeader className="p-4">
                <DialogTitle className={'flex gap-2 text-green-800 dark:text-green-400'}>
                    <CheckCircle className={'size-5'} />
                    Success
                </DialogTitle>
                <DialogDescription>Thank-you for submitting your feedback.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button
                    aria-label="Dismiss Feedback Dialog"
                    className={'gap-2 text-base text-secondary-foreground'}
                    onClick={closeDialog}
                    variant={'outline'}
                >
                    Dismiss
                </Button>
            </DialogFooter>
        </>
    )
}

export default Feedback
