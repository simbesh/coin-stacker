import React, { FormEvent, useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CheckCircle, MessageCircleHeart, Send } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import posthog from 'posthog-js'
import { RiGithubLine } from 'react-icons/ri'

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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={'ghost'}
                    className={'group gap-2 text-base'}
                    aria-label="Open Feedback Dialog"
                    onClick={() => posthog.capture('open-feedback')}
                >
                    <MessageCircleHeart className={'group-hover:text-primary transition-color duration-200 size-5'} />
                    <span className={''}>Feedback</span>
                </Button>
            </DialogTrigger>
            <DialogContent
                className="bg-card h-fit transition-all duration-1000 sm:max-w-[425px]"
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
                                <Label htmlFor="name" className="text-right">
                                    Github
                                </Label>
                                <Button
                                    className={'col-span-3'}
                                    variant={'link'}
                                    aria-label="Create Github Issue"
                                    asChild
                                >
                                    <a
                                        href={'https://github.com/simbesh/coin-stacker/issues/new'}
                                        target={'_blank'}
                                        className={'flex gap-2'}
                                        onClick={() => posthog.capture('feedback-github-issue')}
                                    >
                                        <RiGithubLine className={'size-5'} />
                                        Create Issue
                                    </a>
                                </Button>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Telegram
                                </Label>
                                <Button
                                    className={'col-span-3'}
                                    variant={'link'}
                                    aria-label="Open Telegram Chat"
                                    asChild
                                >
                                    <a
                                        href={process.env.NEXT_PUBLIC_TELEGRAM_GROUP_URL}
                                        target={'_blank'}
                                        className={'flex gap-2'}
                                        onClick={() => posthog.capture('feedback-telegram-group')}
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
                                            id="title"
                                            placeholder="Title (optional)"
                                            className="col-span-4"
                                            value={contactFormData.title}
                                            onChange={(e) =>
                                                setContactFormData((prev) => ({ ...prev, title: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        {/*<Label htmlFor="username" className="text-right">*/}
                                        {/*    Email <span className={'text-muted-foreground'}>(optional)</span>*/}
                                        {/*</Label>*/}
                                        <Input
                                            id="email"
                                            placeholder="Email (optional)"
                                            type="email"
                                            className="col-span-4"
                                            value={contactFormData.email}
                                            onChange={(e) =>
                                                setContactFormData((prev) => ({ ...prev, email: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        {/*<Label htmlFor="username" className="text-right">*/}
                                        {/*    Message <span className={'font-bold text-red-500'}>*</span>*/}
                                        {/*</Label>*/}
                                        <Textarea
                                            placeholder="Type your message here.*"
                                            className="bg-card col-span-4"
                                            value={contactFormData.message}
                                            onChange={(e) =>
                                                setContactFormData((prev) => ({ ...prev, message: e.target.value }))
                                            }
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className={'mt-6 w-full'}
                                    disabled={contactFormData.message === ''}
                                    isLoading={isLoading}
                                    aria-label="Send Feedback"
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
                    variant={'outline'}
                    className={'text-secondary-foreground gap-2 text-base'}
                    onClick={closeDialog}
                    aria-label="Dismiss Feedback Dialog"
                >
                    Dismiss
                </Button>
            </DialogFooter>
        </>
    )
}

export default Feedback
